package com.angelica.landsalesbackend.lot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lot_map_shapes")
public class LotMapShape {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_id", nullable = false, unique = true)
    private Lot lot;

    @Column(name = "svg_path", nullable = false, columnDefinition = "text")
    private String svgPath;

    @Column(name = "label_x", precision = 12, scale = 2)
    private BigDecimal labelX;

    @Column(name = "label_y", precision = 12, scale = 2)
    private BigDecimal labelY;

    @Column(precision = 8, scale = 2)
    private BigDecimal rotation = BigDecimal.ZERO;

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
        if (rotation == null) {
            rotation = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public void setLot(Lot lot) {
        this.lot = lot;
    }

    public String getSvgPath() {
        return svgPath;
    }

    public void setSvgPath(String svgPath) {
        this.svgPath = svgPath;
    }

    public BigDecimal getLabelX() {
        return labelX;
    }

    public void setLabelX(BigDecimal labelX) {
        this.labelX = labelX;
    }

    public BigDecimal getLabelY() {
        return labelY;
    }

    public void setLabelY(BigDecimal labelY) {
        this.labelY = labelY;
    }

    public BigDecimal getRotation() {
        return rotation;
    }

    public void setRotation(BigDecimal rotation) {
        this.rotation = rotation;
    }
}
