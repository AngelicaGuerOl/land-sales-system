package com.angelica.landsalesbackend.lot.controller;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.service.LotService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lots")
public class LotController {

    private final LotService lotService;

    public LotController(LotService lotService) {
        this.lotService = lotService;
    }

    @GetMapping
    public ResponseEntity<List<LotResponse>> findLots(
            @RequestParam(required = false) Long lotificationId,
            @RequestParam(required = false) Long blockId,
            @RequestParam(required = false) LotStatus status,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(lotService.findLots(lotificationId, blockId, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LotResponse> getLot(@PathVariable Long id) {
        return ResponseEntity.ok(lotService.getLot(id));
    }
}
