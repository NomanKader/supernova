function mapCustomerEntity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.CustomerID,
    name: row.CustomerName,
    phoneNumber: row.PhoneNumber,
    address: row.Address,
    businessName: row.BusinessName,
    createdBy: row.CreatedBy,
    createdAt: row.CreatedDate,
    updatedBy: row.UpdatedBy,
    updatedAt: row.UpdatedDate,
  };
}

module.exports = {
  mapCustomerEntity,
};
