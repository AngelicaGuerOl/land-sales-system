package com.angelica.landsalesbackend.lotification.controller;

import com.angelica.landsalesbackend.lotification.dto.LotificationMapResponse;
import com.angelica.landsalesbackend.lotification.dto.LotificationResponse;
import com.angelica.landsalesbackend.lotification.service.LotificationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lotifications")
public class LotificationController {

    private final LotificationService lotificationService;

    public LotificationController(LotificationService lotificationService) {
        this.lotificationService = lotificationService;
    }

    @GetMapping
    public ResponseEntity<List<LotificationResponse>> findAll() {
        return ResponseEntity.ok(lotificationService.findAll());
    }

    @GetMapping("/{id}/map")
    public ResponseEntity<LotificationMapResponse> getMap(@PathVariable Long id) {
        return ResponseEntity.ok(lotificationService.getMap(id));
    }
}
