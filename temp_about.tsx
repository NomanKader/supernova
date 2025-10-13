import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

export default function About() {
  const team = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'CEO & Founder',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20female%20CEO%20with%20warm%20smile%2C%20clean%20blue%20background%2C%20business%20suit%2C%20modern%20executive%20portrait%20style%20with%20leadership%20presence&width=300&height=300&seq=team1&orientation=squarish',
      bio: 'Former Stanford professor with 15+ years in educational technology. Passionate about democratizing quality education.'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20male%20technology%20executive%20with%20friendly%20expression%2C%20clean%20blue%20background%2C%20business%20casual%20attire%2C%20modern%20tech%20leader%20portrait&width=300&height=300&seq=team2&orientation=squarish',
      bio: 'Ex-Google engineer specializing in scalable learning platforms. Expert in AI-driven educational solutions.'
    },
    {
      name: 'Emily Chen',
      role: 'Head of Content',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20female%20content%20director%20with%20creative%20energy%2C%20clean%20blue%20background%2C%20modern%20business%20attire%2C%20educational%20content%20expert%20portrait&width=300&height=300&seq=team3&orientation=squarish',
      bio: 'Award-winning curriculum designer with expertise in creating engaging, industry-relevant course content.'
    },
    {
      name: 'David Thompson',
      role: 'Head of Student Success',
      image: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20male%20student%20success%20manager%20with%20approachable%20demeanor%2C%20clean%20blue%20background%2C%20business%20casual%20shirt%2C%20supportive%20educator%20portrait&width=300&height=300&seq=team4&orientation=squarish',
      bio: 'Dedicated to ensuring every student achieves their learning goals through personalized support and mentorship.'
    }
  ];

  const values = [
    {
      icon: 'ri-lightbulb-line',
      title: 'Innovation',
      description: 'We continuously evolve our platform with cutting-edge technology to enhance the learning experience.'
    },
    {
      icon: 'ri-heart-line',
      title: 'Accessibility',
      description: 'Quality education should be available to everyone, regardless of background or location.'
    },
    {
      icon: 'ri-star-line',
      title: 'Excellence',
      description: 'We maintain the highest standards in course quality, instruction, and student support.'
    },
    {
      icon: 'ri-team-line',
      title: 'Community',
      description: 'Learning is better together. We foster a supportive community of learners and educators.'
    }
  ];

  const milestones = [
    { year: '2018', event: 'Supernova founded with a vision to transform online education' },
    { year: '2019', event: 'Launched first 10 courses with industry expert instructors' },
    { year: '2020', event: 'Reached 10,000 students and expanded to mobile learning' },
    { year: '2021', event: 'Introduced AI-powered personalized learning paths' },
    { year: '2022', event: 'Partnered with Fortune 500 companies for corporate training' },
    { year: '2023', event: 'Achieved 50,000+ active learners and 95% completion rate' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.9), rgba(29, 78, 216, 0.8)), url('https://readdy.ai/api/search-image?query=modern%20educational%20institution%20building%20with%20glass%20architecture%20and%20blue%20lighting%2C%20contemporary%20learning%20environment%20with%20students%20collaborating%2C%20professional%20academic%20atmosphere%20with%20innovative%20design%20elements&width=1200&height=600&seq=about-hero&orientation=landscape')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Supernova
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            We're on a mission to make world-class education accessible to everyone, everywhere. 
            Join us in transforming lives through the power of learning.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                At Supernova, we believe that education is the most powerful tool for personal and professional transformation. 
                Our mission is to democratize access to high-quality, industry-relevant education that empowers individuals 
                to achieve their career goals and unlock their full potential.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We partner with industry experts and leading professionals to create courses that bridge the gap between 
                traditional education and real-world skills. Every course is designed with practical applications, 
                hands-on projects, and career-focused outcomes.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://readdy.ai/api/search-image?query=diverse%20group%20of%20students%20learning%20together%20in%20modern%20classroom%20with%20laptops%20and%20collaborative%20workspace%2C%20blue%20themed%20educational%20environment%20with%20natural%20lighting%2C%20inclusive%20learning%20atmosphere&width=600&height=400&seq=mission&orientation=landscape"
                alt="Students learning together"
                className="rounded-xl shadow-lg object-cover object-top w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className={`${value.icon} text-blue-600 text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              Passionate educators and technologists dedicated to your success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-48 h-48 rounded-full object-cover object-top mx-auto mb-6 shadow-lg"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to transform education
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {milestone.year}
                      </div>
                      <p className="text-gray-700">
                        {milestone.event}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50,000+</div>
              <div className="text-blue-200">Students Worldwide</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <div className="text-blue-200">Expert Courses</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Completion Rate</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-blue-200">Industry Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Join Our Learning Community?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your journey with Supernova today and unlock your potential with our expert-led courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg whitespace-nowrap cursor-pointer">
              Browse Courses
            </button>
            <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-lg whitespace-nowrap cursor-pointer">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
