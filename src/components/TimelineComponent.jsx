import React from "react";

const timelineData = [
  { year: "2018", text: "Supernova founded with a vision to transform online education" },
  { year: "2019", text: "Launched first 10 courses with industry expert instructors" },
  { year: "2020", text: "Reached 10,000 students and expanded to mobile learning" },
  { year: "2021", text: "Introduced AI-powered personalized learning paths" },
  { year: "2022", text: "Partnered with Fortune 500 companies for corporate training" },
  { year: "2023", text: "Achieved 50,000+ active learners and 95% completion rate" },
];

export default function Timeline() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Center Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[3px] bg-blue-500" />

        <div className="flex flex-col space-y-14">
          {timelineData.map((item, index) => (
            <div
              key={index}
              className={`relative flex items-center w-full ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              {/* Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10" />

              {/* Card */}
              <div
                className={`w-[45%] p-6 bg-white rounded-2xl shadow-md ${
                  index % 2 === 0 ? "mr-16" : "ml-16"
                }`}
              >
                <h3 className="text-blue-600 font-semibold text-lg mb-2">
                  {item.year}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
