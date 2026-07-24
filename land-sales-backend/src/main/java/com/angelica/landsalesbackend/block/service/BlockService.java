package com.angelica.landsalesbackend.block.service;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.dto.CreateBlockRequest;
import com.angelica.landsalesbackend.block.dto.BulkLotRequest;
import com.angelica.landsalesbackend.block.dto.BulkLotResponse;
import com.angelica.landsalesbackend.block.dto.UpdateBlockRequest;
import java.util.List;

public interface BlockService {

    List<BlockResponse> findBlocks(Long lotificationId);
    BlockResponse getBlock(Long id);
    BlockResponse createBlock(CreateBlockRequest request);
    BlockResponse updateBlock(Long id, UpdateBlockRequest request);
    void deleteBlock(Long id);
    BulkLotResponse generateLots(Long blockId, BulkLotRequest request);
}
