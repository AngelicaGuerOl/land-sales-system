package com.angelica.landsalesbackend.block.service;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.mapper.BlockMapper;
import com.angelica.landsalesbackend.block.repository.BlockRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlockServiceImpl implements BlockService {

    private final BlockRepository blockRepository;
    private final BlockMapper blockMapper;

    public BlockServiceImpl(BlockRepository blockRepository, BlockMapper blockMapper) {
        this.blockRepository = blockRepository;
        this.blockMapper = blockMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlockResponse> findBlocks(Long lotificationId) {
        return blockRepository.findBlocks(lotificationId)
                .stream()
                .map(blockMapper::toResponse)
                .toList();
    }
}
