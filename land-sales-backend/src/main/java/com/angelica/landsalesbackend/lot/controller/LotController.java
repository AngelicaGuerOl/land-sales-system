package com.angelica.landsalesbackend.lot.controller;

import com.angelica.landsalesbackend.lot.dto.ChangeLotStatusRequest;
import com.angelica.landsalesbackend.lot.dto.CreateLotRequest;
import com.angelica.landsalesbackend.lot.dto.LotPriceHistoryResponse;
import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.dto.UpdateLotRequest;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.service.LotService;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<LotResponse> createLot(@Valid @RequestBody CreateLotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lotService.createLot(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LotResponse> updateLot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLotRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        return ResponseEntity.ok(lotService.updateLot(id, request, authenticatedUser));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LotResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeLotStatusRequest request
    ) {
        return ResponseEntity.ok(lotService.changeStatus(id, request));
    }

    @GetMapping("/{id}/price-history")
    public ResponseEntity<List<LotPriceHistoryResponse>> getPriceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(lotService.getPriceHistory(id));
    }
}
