package lms_backend.controller;

import lms_backend.entity.LiveStream;
import lms_backend.repository.LiveStreamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live-streams")
public class LiveStreamController {

    @Autowired
    private LiveStreamRepository liveStreamRepository;

    @GetMapping
    public List<LiveStream> getAllStreams() {
        return liveStreamRepository.findAll();
    }

    @PostMapping
    public LiveStream createStream(@RequestBody LiveStream stream) {
        // Validation could be added here
        return liveStreamRepository.save(stream);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStream(@PathVariable Long id) {
        return liveStreamRepository.findById(id)
                .map(stream -> {
                    liveStreamRepository.delete(stream);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LiveStream> updateStream(@PathVariable Long id, @RequestBody LiveStream updatedStream) {
        return liveStreamRepository.findById(id)
                .map(stream -> {
                    stream.setName(updatedStream.getName());
                    stream.setUrl(updatedStream.getUrl());
                    stream.setCategory(updatedStream.getCategory());
                    // Not updating isLive here to avoid triggering global changes inadvertently
                    return ResponseEntity.ok(liveStreamRepository.save(stream));
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/live-status")
    @Transactional
    public ResponseEntity<LiveStream> updateLiveStatus(@PathVariable Long id, @RequestParam boolean isLive) {
        return liveStreamRepository.findById(id)
                .map(stream -> {
                    if (isLive) {
                        // Set all others to false first
                        liveStreamRepository.setAllOtherStreamsNotLiveInCategory(id, stream.getCategory());
                    }
                    
                    stream.setLive(isLive);
                    LiveStream savedStream = liveStreamRepository.save(stream);
                    
                    return ResponseEntity.ok(savedStream);
                }).orElse(ResponseEntity.notFound().build());
    }
}
