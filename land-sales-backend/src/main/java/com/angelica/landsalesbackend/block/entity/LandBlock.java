package com.angelica.landsalesbackend.block.entity;

import com.angelica.landsalesbackend.lotification.entity.Lotification;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "blocks")
public class LandBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lotification_id", nullable = false)
    private Lotification lotification;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "area_m2", precision = 12, scale = 2)
    private BigDecimal areaM2;

    @Column(name = "lot_count", nullable = false)
    private Integer lotCount = 0;

    @Column(name = "reference_color", length = 20)
    private String referenceColor;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (lotCount == null) {
            lotCount = 0;
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

    public Lotification getLotification() {
        return lotification;
    }

    public void setLotification(Lotification lotification) {
        this.lotification = lotification;
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

    public Integer getLotCount() {
        return lotCount;
    }

    public void setLotCount(Integer lotCount) {
        this.lotCount = lotCount;
    }

    public String getReferenceColor() {
        return referenceColor;
    }

    public void setReferenceColor(String referenceColor) {
        this.referenceColor = referenceColor;
    }
}
