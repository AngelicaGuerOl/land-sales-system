package com.angelica.landsalesbackend.block.controller;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.dto.CreateBlockRequest;
import com.angelica.landsalesbackend.block.dto.BulkLotRequest;
import com.angelica.landsalesbackend.block.dto.BulkLotResponse;
import com.angelica.landsalesbackend.block.dto.UpdateBlockRequest;
import com.angelica.landsalesbackend.block.service.BlockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blocks")
public class BlockController {

    private final BlockService blockService;

    public BlockController(BlockService blockService) {
        this.blockService = blockService;
    }

    @GetMapping
    public ResponseEntity<List<BlockResponse>> findBlocks(@RequestParam(required = false) Long lotificationId) {
        return ResponseEntity.ok(blockService.findBlocks(lotificationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlockResponse> getBlock(@PathVariable Long id) {
        return ResponseEntity.ok(blockService.getBlock(id));
    }

    @PostMapping
    public ResponseEntity<BlockResponse> createBlock(@Valid @RequestBody CreateBlockRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blockService.createBlock(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlockResponse> updateBlock(@PathVariable Long id, @Valid @RequestBody UpdateBlockRequest request) {
        return ResponseEntity.ok(blockService.updateBlock(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(@PathVariable Long id) {
        blockService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{blockId}/lots/bulk")
    public ResponseEntity<BulkLotResponse> generateLots(
            @PathVariable Long blockId,
            @Valid @RequestBody BulkLotRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(blockService.generateLots(blockId, request));
    }
}
