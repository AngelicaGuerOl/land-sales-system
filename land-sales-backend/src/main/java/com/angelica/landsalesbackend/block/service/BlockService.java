package com.angelica.landsalesbackend.block.service;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import java.util.List;

public interface BlockService {

    List<BlockResponse> findBlocks(Long lotificationId);
}
