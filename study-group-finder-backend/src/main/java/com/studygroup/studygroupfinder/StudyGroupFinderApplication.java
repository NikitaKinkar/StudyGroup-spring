package com.studygroup.studygroupfinder;

import com.studygroup.studygroupfinder.model.Course;
import com.studygroup.studygroupfinder.repository.CourseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class StudyGroupFinderApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyGroupFinderApplication.class, args);
    }

    @Bean
    CommandLineRunner seedCourses(CourseRepository courseRepository) {
        return args -> {
            if (courseRepository.count() == 0) {
                Course c1 = new Course("Computer Science Engineering (AI & ML)", "Learn programming, algorithms, data structures, and AI fundamentals.", "Dr. Rajesh Kumar", "4 years", "Undergraduate", "");
                Course c2 = new Course("Computer Science Engineering (Cyber Security)", "Focus on network security, cryptography, and cyber defense strategies.", "Dr. Priya Sharma", "4 years", "Undergraduate", "");
                Course c3 = new Course("Computer Science Engineering (Data Science)", "Data analysis, machine learning, and big data technologies.", "Dr. Amit Patel", "4 years", "Undergraduate", "");
                Course c4 = new Course("Electrical and Electronics Engineering", "Power systems, electronics, and electrical machine design.", "Dr. Suresh Reddy", "4 years", "Undergraduate", "");
                Course c5 = new Course("Electronics and Instrumentation Engineering", "Process control, instrumentation, and measurement systems.", "Dr. Anjali Nair", "4 years", "Undergraduate", "");
                Course c6 = new Course("Information Technology", "Software development, networking, and IT infrastructure management.", "Dr. Vikram Mehta", "4 years", "Undergraduate", "");
                Course c7 = new Course("Civil Engineering", "Structural design, construction management, and infrastructure development.", "Dr. Ramesh Kumar", "4 years", "Undergraduate", "");
                Course c8 = new Course("Master of Business Administration", "Advanced business management, leadership, and strategic planning.", "Dr. Sarah Johnson", "2 years", "Postgraduate", "");
                Course c9 = new Course("Bachelor of Business Administration", "Business fundamentals, management principles, and entrepreneurship.", "Dr. Michael Brown", "3 years", "Undergraduate", "");
                courseRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5, c6, c7, c8, c9));
            }
        };
    }
}
