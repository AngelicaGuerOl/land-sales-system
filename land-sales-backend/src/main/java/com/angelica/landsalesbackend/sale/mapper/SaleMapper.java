package com.angelica.landsalesbackend.sale.mapper;

import com.angelica.landsalesbackend.sale.dto.SaleInstallmentResponse;
import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SaleMapper {
    SaleInstallmentResponse toInstallmentResponse(SaleInstallment installment);
}
