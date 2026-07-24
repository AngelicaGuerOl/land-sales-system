package com.angelica.landsalesbackend.customer.mapper;

import com.angelica.landsalesbackend.customer.dto.CreateCustomerRequest;
import com.angelica.landsalesbackend.customer.dto.CustomerResponse;
import com.angelica.landsalesbackend.customer.dto.UpdateCustomerRequest;
import com.angelica.landsalesbackend.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CreateCustomerRequest request);

    @Mapping(target = "active", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdateCustomerRequest request, @MappingTarget Customer customer);

    CustomerResponse toResponse(Customer customer);
}
