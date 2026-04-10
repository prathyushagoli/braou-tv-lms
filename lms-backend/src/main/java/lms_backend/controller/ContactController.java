package lms_backend.controller;

import lms_backend.entity.Contact;
import lms_backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactRepository contactRepository;

    @GetMapping
    public ResponseEntity<Contact> getContact() {
        return contactRepository.findById(1L)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new Contact()));
    }

    @PutMapping
    public ResponseEntity<Contact> updateContact(@RequestBody Contact req) {
        Contact contact = contactRepository.findById(1L).orElse(new Contact());
        contact.setId(1L);
        contact.setName(req.getName());
        contact.setDesignation(req.getDesignation());
        contact.setEmail(req.getEmail());
        contact.setMobile1(req.getMobile1());
        contact.setMobile2(req.getMobile2());
        contact.setLaunchVideoUrl(req.getLaunchVideoUrl());
        contact.setIsLaunchVideoActive(req.getIsLaunchVideoActive());

        Contact updated = contactRepository.save(contact);
        return ResponseEntity.ok(updated);
    }
}
