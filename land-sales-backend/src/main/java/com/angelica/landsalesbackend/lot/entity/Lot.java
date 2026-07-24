package com.angelica.landsalesbackend.lot.entity;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lots")
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "block_id", nullable = false)
    private LandBlock block;

    @Column(name = "lot_number", nullable = false, length = 50)
    private String lotNumber;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "area_m2", precision = 12, scale = 2)
    private BigDecimal areaM2;

    @Column(name = "front_meters", precision = 10, scale = 2)
    private BigDecimal frontMeters;

    @Column(name = "depth_meters", precision = 10, scale = 2)
    private BigDecimal depthMeters;

    @Column(name = "current_price", precision = 14, scale = 2)
    private BigDecimal currentPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LotStatus status = LotStatus.AVAILABLE;

    @Column(name = "location_reference", columnDefinition = "text")
    private String locationReference;

    @Column(columnDefinition = "text")
    private String notes;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToOne(mappedBy = "lot", fetch = FetchType.LAZY)
    private LotMapShape mapShape;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null) {
            status = LotStatus.AVAILABLE;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LandBlock getBlock() {
        return block;
    }

    public void setBlock(LandBlock block) {
        this.block = block;
    }

    public String getLotNumber() {
        return lotNumber;
    }

    public void setLotNumber(String lotNumber) {
        this.lotNumber = lotNumber;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getAreaM2() {
        return areaM2;
    }

    public void setAreaM2(BigDecimal areaM2) {
        this.areaM2 = areaM2;
    }

    public BigDecimal getFrontMeters() {
        return frontMeters;
    }

    public void setFrontMeters(BigDecimal frontMeters) {
        this.frontMeters = frontMeters;
    }

    public BigDecimal getDepthMeters() {
        return depthMeters;
    }

    public void setDepthMeters(BigDecimal depthMeters) {
        this.depthMeters = depthMeters;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public LotStatus getStatus() {
        return status;
    }

    public void setStatus(LotStatus status) {
        this.status = status;
    }

    public String getLocationReference() {
        return locationReference;
    }

    public void setLocationReference(String locationReference) {
        this.locationReference = locationReference;
    }

    public LotMapShape getMapShape() {
        return mapShape;
    }

    public void setMapShape(LotMapShape mapShape) {
        this.mapShape = mapShape;
    }
}
