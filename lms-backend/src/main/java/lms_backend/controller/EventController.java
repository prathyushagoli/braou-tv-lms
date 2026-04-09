package lms_backend.controller;

import lms_backend.entity.Event;
import lms_backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setTitle(updatedEvent.getTitle());
                    event.setUrl(updatedEvent.getUrl());
                    event.setType(updatedEvent.getType());
                    event.setEventDate(updatedEvent.getEventDate());
                    return ResponseEntity.ok(eventRepository.save(event));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(event -> {
                    eventRepository.delete(event);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
