package lms_backend.controller;

import lms_backend.entity.Course;
import lms_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course updatedCourse) {
        return courseRepository.findById(id)
                .map(course -> {
                    course.setTitle(updatedCourse.getTitle());
                    course.setType(updatedCourse.getType());
                    course.setSubject(updatedCourse.getSubject());
                    course.setCourseYear(updatedCourse.getCourseYear());
                    course.setSemester(updatedCourse.getSemester());
                    course.setUrl(updatedCourse.getUrl());
                    return ResponseEntity.ok(courseRepository.save(course));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(course -> {
                    courseRepository.delete(course);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}