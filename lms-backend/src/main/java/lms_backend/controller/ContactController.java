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
        java.util.List<Contact> all = contactRepository.findAll();
        if (!all.isEmpty()) {
            return ResponseEntity.ok(all.get(0));
        }
        return ResponseEntity.ok(new Contact());
    }

    @PutMapping
    public ResponseEntity<Contact> updateContact(@RequestBody Contact req) {
        java.util.List<Contact> all = contactRepository.findAll();
        Contact contact = all.isEmpty() ? new Contact() : all.get(0);
        
        contact.setName(req.getName());
        contact.setDesignation(req.getDesignation());
        contact.setEmail(req.getEmail());
        contact.setMobile1(req.getMobile1());
        contact.setMobile2(req.getMobile2());

        Contact updated = contactRepository.save(contact);
        return ResponseEntity.ok(updated);
    }
}
