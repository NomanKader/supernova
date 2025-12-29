const {
  S3Client,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  UploadPartCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { loadConfig } = require('./env');

let cachedClient = null;

function getS3Client() {
  if (cachedClient) {
    return cachedClient;
  }
  const config = loadConfig();
  if (!config.awsRegion) {
    throw new Error('AWS_REGION must be configured to use S3 storage.');
  }

  const credentials =
    config.awsAccessKeyId && config.awsSecretAccessKey
      ? {
          accessKeyId: config.awsAccessKeyId,
          secretAccessKey: config.awsSecretAccessKey,
        }
      : undefined;

  cachedClient = new S3Client({
    region: config.awsRegion,
    credentials,
  });
  return cachedClient;
}

async function uploadBufferToS3({ bucket, key, body, contentType }) {
  if (!bucket) {
    throw new Error('LESSONS_S3_BUCKET must be configured to use S3 storage.');
  }
  if (!key) {
    throw new Error('Cannot upload to S3 without a key.');
  }
  if (!body) {
    throw new Error('Cannot upload empty body to S3.');
  }

  const client = getS3Client();
  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    },
  });
  await upload.done();

  return { bucket, key };
}

async function createMultipartUpload({ bucket, key, contentType }) {
  const client = getS3Client();
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });
  return client.send(command);
}

async function generatePartUploadUrl({ bucket, key, uploadId, partNumber, expiresIn = 3600 }) {
  const client = getS3Client();
  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(client, command, { expiresIn });
}

async function completeMultipartUpload({ bucket, key, uploadId, parts }) {
  const client = getS3Client();
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });
  return client.send(command);
}

async function abortMultipartUpload({ bucket, key, uploadId }) {
  const client = getS3Client();
  const command = new AbortMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
  });
  return client.send(command);
}

function buildPublicS3Url(key) {
  const config = loadConfig();
  if (!key) {
    return null;
  }
  const normalizedBase = config.lessonsCdnBaseUrl
    ? config.lessonsCdnBaseUrl.replace(/\/+$/, '')
    : null;
  if (normalizedBase) {
    return `${normalizedBase}/${key}`;
  }
  if (!config.lessonsS3Bucket) {
    return null;
  }
  const regionSegment = config.awsRegion ? `.${config.awsRegion}` : '';
  return `https://${config.lessonsS3Bucket}.s3${regionSegment}.amazonaws.com/${key}`;
}

async function deleteObjectFromS3({ bucket, key }) {
  if (!bucket || !key) {
    return false;
  }
  const client = getS3Client();
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to delete object from S3', { bucket, key, error });
    return false;
  }
}

module.exports = {
  getS3Client,
  uploadBufferToS3,
  createMultipartUpload,
  generatePartUploadUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  buildPublicS3Url,
  deleteObjectFromS3,
};
