
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: 'ri-play-circle-line',
      title: 'Interactive Video Lessons',
      description: 'Engage with high-quality video content designed by industry experts to maximize your learning experience.'
    },
    {
      icon: 'ri-award-line',
      title: 'Industry Certifications',
      description: 'Earn recognized certifications that validate your skills and boost your career prospects in the job market.'
    },
    {
      icon: 'ri-team-line',
      title: 'Expert Instructors',
      description: 'Learn from seasoned professionals with years of real-world experience in their respective fields.'
    },
    {
      icon: 'ri-time-line',
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access to course materials that fit your busy lifestyle.'
    },
    {
      icon: 'ri-chat-3-line',
      title: 'Community Support',
      description: 'Connect with fellow learners and get help from our active community of students and mentors.'
    },
    {
      icon: 'ri-smartphone-line',
      title: 'Mobile Learning',
      description: 'Access your courses anywhere, anytime with our mobile-optimized platform and offline capabilities.'
    }
  ];

  const courses = [
    {
      title: 'Full Stack Web Development',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      students: 12847,
      price: 89,
      image: 'https://readdy.ai/api/search-image?query=modern%20web%20development%20workspace%20with%20multiple%20monitors%20showing%20code%20editor%20and%20website%20designs%2C%20clean%20minimalist%20office%20environment%20with%20bright%20cyan%20and%20blue%20accent%20lighting%2C%20professional%20developer%20setup%20with%20laptop%20and%20coding%20books%2C%20contemporary%20tech%20atmosphere&width=400&height=250&seq=course1&orientation=landscape',
      category: 'Development'
    },
    {
      title: 'Digital Marketing Mastery',
      instructor: 'Michael Chen',
      rating: 4.8,
      students: 9563,
      price: 79,
      image: 'https://readdy.ai/api/search-image?query=digital%20marketing%20analytics%20dashboard%20on%20computer%20screen%20showing%20graphs%20and%20social%20media%20metrics%2C%20modern%20office%20desk%20with%20smartphone%20and%20marketing%20materials%2C%20bright%20cyan%20and%20blue%20themed%20workspace%20with%20professional%20lighting&width=400&height=250&seq=course2&orientation=landscape',
      category: 'Marketing'
    },
    {
      title: 'Data Science & Analytics',
      instructor: 'Dr. Emily Rodriguez',
      rating: 4.9,
      students: 8234,
      price: 99,
      image: 'https://readdy.ai/api/search-image?query=data%20science%20visualization%20with%20charts%20and%20graphs%20on%20multiple%20screens%2C%20modern%20analytics%20workspace%20with%20bright%20cyan%20and%20blue%20color%20scheme%2C%20professional%20data%20analyst%20setup%20with%20notebooks%20and%20statistical%20reports&width=400&height=250&seq=course3&orientation=landscape',
      category: 'Data Science'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Thompson',
      role: 'Software Engineer at Google',
      content: 'Supernova transformed my career. The courses are incredibly well-structured and the instructors are top-notch. I landed my dream job within 6 months of completing the program.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20male%20software%20engineer%20with%20friendly%20smile%2C%20clean%20bright%20cyan%20background%2C%20business%20casual%20attire%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial1&orientation=squarish'
    },
    {
      name: 'Maria Garcia',
      role: 'Digital Marketing Manager',
      content: 'The practical approach and real-world projects made all the difference. I gained skills that I immediately applied in my work, leading to a promotion and salary increase.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20female%20marketing%20professional%20with%20warm%20smile%2C%20clean%20bright%20cyan%20background%2C%20business%20attire%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial2&orientation=squarish'
    },
    {
      name: 'David Kim',
      role: 'Data Analyst at Microsoft',
      content: 'The flexibility of learning at my own pace while working full-time was perfect. The community support and mentorship program exceeded my expectations.',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20headshot%20of%20confident%20young%20male%20data%20analyst%20with%20glasses%20and%20friendly%20expression%2C%20clean%20bright%20cyan%20background%2C%20business%20casual%20shirt%2C%20modern%20professional%20portrait%20style&width=80&height=80&seq=testimonial3&orientation=squarish'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Students' },
    { number: '200+', label: 'Expert Courses' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.8)), url('https://readdy.ai/api/search-image?query=modern%20online%20learning%20environment%20with%20students%20using%20laptops%20and%20tablets%20in%20bright%20contemporary%20classroom%2C%20vibrant%20cyan%20and%20blue%20ambient%20lighting%20creating%20energetic%20educational%20atmosphere%2C%20diverse%20group%20of%20learners%20engaged%20with%20digital%20devices%2C%20clean%20minimalist%20design%20with%20bright%20technology%20focus&width=1200&height=600&seq=hero1&orientation=landscape')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transform Your Future with
                <span className="text-yellow-300 block">Expert-Led Courses</span>
              </h1>
              <p className="text-xl text-cyan-100 leading-relaxed">
                Join thousands of successful learners who have advanced their careers with our comprehensive online learning platform. Master in-demand skills with industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/get-started"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all text-lg whitespace-nowrap cursor-pointer text-center shadow-xl"
                >
                  Start Learning Today
                </Link>
                <Link 
                  to="/courses"
                  className="px-8 py-4 border-2 border-cyan-300 text-cyan-100 font-semibold rounded-lg hover:bg-cyan-400 hover:text-white transition-all text-lg whitespace-nowrap cursor-pointer text-center"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-16 h-16 bg-cyan-300/20 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Supernova?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to succeed in your learning journey with cutting-edge technology and expert guidance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:from-cyan-200 group-hover:to-blue-200 transition-all">
                  <i className={`${feature.icon} text-cyan-600 text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular courses designed to accelerate your career growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-product-shop>
            {courses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">by {course.instructor}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`ri-star-${i < Math.floor(course.rating) ? 'fill' : 'line'} text-yellow-400 text-sm`}></i>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({course.rating})</span>
                    </div>
                    <span className="text-sm text-gray-500">{course.students.toLocaleString()} students</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">${course.price}</span>
                    <Link 
                      to={`/course/${index + 1}`}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all whitespace-nowrap cursor-pointer shadow-lg"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/courses"
              className="px-8 py-3 border-2 border-cyan-500 text-cyan-600 font-semibold rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white transition-all whitespace-nowrap cursor-pointer shadow-lg"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our graduates who transformed their careers with Supernova
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover object-top mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-cyan-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful learners and take the first step towards your dream career today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/get-started"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all text-lg whitespace-nowrap cursor-pointer shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/courses"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-cyan-600 transition-all text-lg whitespace-nowrap cursor-pointer"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

