package com.angelica.landsalesbackend;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotMapShape;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.repository.LotMapShapeRepository;
import com.angelica.landsalesbackend.lot.repository.LotPriceHistoryRepository;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.lotification.entity.Lotification;
import com.angelica.landsalesbackend.lotification.repository.LotificationRepository;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class LandSalesBackendApplicationTests {

    private static final String JWT_SECRET = "test-secret-with-more-than-thirty-two-characters";
    private static final String EXTERNAL_DATABASE_URL = System.getenv("LAND_SALES_TEST_DB_URL");

    static final PostgreSQLContainer<?> POSTGRES = startPostgresIfNeeded();

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LotificationRepository lotificationRepository;

    @Autowired
    BlockRepository blockRepository;

    @Autowired
    LotRepository lotRepository;

    @Autowired
    LotMapShapeRepository lotMapShapeRepository;

    @Autowired
    LotPriceHistoryRepository lotPriceHistoryRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    private Long lotificationId;
    private Long blockOneId;
    private Long lotOneId;
    private Long soldLotId;

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", LandSalesBackendApplicationTests::databaseUrl);
        registry.add("spring.datasource.username", LandSalesBackendApplicationTests::databaseUsername);
        registry.add("spring.datasource.password", LandSalesBackendApplicationTests::databasePassword);
        registry.add("app.security.jwt.secret", () -> JWT_SECRET);
        registry.add("app.security.jwt.expiration", () -> "PT2H");
        registry.add("app.bootstrap-admin.username", () -> "");
        registry.add("app.bootstrap-admin.password", () -> "");
        registry.add("app.bootstrap-admin.full-name", () -> "");
        registry.add("app.demo.enabled", () -> "true");
        registry.add("app.demo.username", () -> "demo");
    }

    @BeforeEach
    void setUp() {
        lotMapShapeRepository.deleteAll();
        lotPriceHistoryRepository.deleteAll();
        lotRepository.deleteAll();
        blockRepository.deleteAll();
        lotificationRepository.deleteAll();
        userRepository.deleteAll();

        User activeUser = user("admin", "Admin User", "password", true);
        userRepository.save(activeUser);
        userRepository.save(user("inactive", "Inactive User", "password", false));
        userRepository.save(user("demo", "Demo User", "demo-password", true));
        userRepository.save(user("inactive-demo", "Inactive Demo User", "demo-password", false));

        Lotification lotification = new Lotification();
        lotification.setName("Lotificacion Norte");
        lotification.setDescription("Primary test lotification");
        lotification.setAddress("Known address");
        lotification.setSvgViewBox("0 0 1920 1080");
        lotification = lotificationRepository.save(lotification);
        lotificationId = lotification.getId();

        Lotification secondLotification = new Lotification();
        secondLotification.setName("Lotificacion Sur");
        lotificationRepository.save(secondLotification);

        LandBlock blockTwo = block(lotification, "MZA-02", "#222222");
        blockTwo = blockRepository.save(blockTwo);

        LandBlock blockOne = block(lotification, "MZA-01", "#000000");
        blockOne = blockRepository.save(blockOne);
        blockOneId = blockOne.getId();

        Lot lotTwo = lot(blockOne, "L-02", "MZA-01-L-02", LotStatus.SOLD);
        lotTwo = lotRepository.save(lotTwo);
        soldLotId = lotTwo.getId();

        Lot lotOne = lot(blockOne, "L-01", "MZA-01-L-01", LotStatus.AVAILABLE);
        lotOne = lotRepository.save(lotOne);
        lotOneId = lotOne.getId();

        Lot lotThree = lot(blockTwo, "L-01", "MZA-02-L-01", LotStatus.BLOCKED);
        lotRepository.save(lotThree);

        LotMapShape shape = new LotMapShape();
        shape.setLot(lotOne);
        shape.setSvgPath("M0 0 L10 0 L10 10 Z");
        shape.setLabelX(new BigDecimal("120.50"));
        shape.setLabelY(new BigDecimal("80.20"));
        shape.setRotation(BigDecimal.ZERO);
        lotMapShapeRepository.save(shape);
    }

    @Test
    void loginSucceeds() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "admin", "password", "password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.username").value("admin"))
                .andExpect(content().string(not(containsString("passwordHash"))))
                .andExpect(content().string(not(containsString("password_hash"))));
    }

    @Test
    void loginPreflightAllowsViteOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    void loginRejectsInvalidCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "admin", "password", "bad"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    void loginRejectsInactiveUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "inactive", "password", "password"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    void demoLoginSucceedsWhenEnabledAndUserIsActive() throws Exception {
        mockMvc.perform(post("/api/auth/demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.username").value("demo"))
                .andExpect(content().string(not(containsString("password"))))
                .andExpect(content().string(not(containsString("passwordHash"))))
                .andExpect(content().string(not(containsString("password_hash"))));
    }

    @Test
    void meReturnsCurrentUser() throws Exception {
        mockMvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(content().string(not(containsString("passwordHash"))))
                .andExpect(content().string(not(containsString("password_hash"))));
    }

    @Test
    void protectedEndpointRejectsMissingJwt() throws Exception {
        mockMvc.perform(get("/api/lotifications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointRejectsInvalidJwt() throws Exception {
        mockMvc.perform(get("/api/lotifications").header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    void listsLotifications() throws Exception {
        mockMvc.perform(get("/api/lotifications").header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Lotificacion Norte"));
    }

    @Test
    void filtersBlocksAndLots() throws Exception {
        mockMvc.perform(get("/api/blocks")
                        .param("lotificationId", lotificationId.toString())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].code").value("MZA-01"))
                .andExpect(jsonPath("$[1].code").value("MZA-02"));

        mockMvc.perform(get("/api/lots")
                        .param("blockId", blockOneId.toString())
                        .param("status", "AVAILABLE")
                        .param("search", "L-01")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].code").value("MZA-01-L-01"));

        mockMvc.perform(get("/api/lots")
                        .param("lotificationId", lotificationId.toString())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void managesBlocksAndCountsRegisteredLots() throws Exception {
        mockMvc.perform(get("/api/blocks")
                        .param("lotificationId", lotificationId.toString())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lotificationName").value("Lotificacion Norte"))
                .andExpect(jsonPath("$[0].plannedLotCount").value(2))
                .andExpect(jsonPath("$[0].registeredLotCount").value(2));

        MvcResult created = mockMvc.perform(post("/api/blocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "lotificationId", lotificationId,
                                "code", "mza-09",
                                "areaM2", new BigDecimal("900.00"),
                                "plannedLotCount", 9,
                                "notes", "Nueva manzana"
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("MZA-09"))
                .andExpect(jsonPath("$.registeredLotCount").value(0))
                .andReturn();
        long createdId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/blocks/{id}", createdId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "lotificationId", lotificationId,
                                "code", "MZA-10",
                                "areaM2", new BigDecimal("950.00"),
                                "plannedLotCount", 10,
                                "notes", "Actualizada"
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("MZA-10"));

        mockMvc.perform(delete("/api/blocks/{id}", createdId)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isNoContent());
    }

    @Test
    void preventsChangingOrDeletingBlockWithLots() throws Exception {
        mockMvc.perform(put("/api/blocks/{id}", blockOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "lotificationId", lotificationId,
                                "code", "MZA-99",
                                "areaM2", new BigDecimal("1000.00"),
                                "plannedLotCount", 5,
                                "notes", "No debe cambiar código"
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/blocks/{id}", blockOneId)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());
    }

    @Test
    void generatesFortyLotsWithExpectedFormatAndAvailableStatus() throws Exception {
        MvcResult blockResult = mockMvc.perform(post("/api/blocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "lotificationId", lotificationId,
                                "code", "MZA-40",
                                "areaM2", new BigDecimal("4000.00"),
                                "plannedLotCount", 40
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isCreated())
                .andReturn();
        long blockId = objectMapper.readTree(blockResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/blocks/{blockId}/lots/bulk", blockId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "startNumber", 1,
                                "endNumber", 40,
                                "numberPrefix", "L-",
                                "numberPadding", 2,
                                "areaM2", new BigDecimal("100.00"),
                                "frontMeters", new BigDecimal("5.00"),
                                "depthMeters", new BigDecimal("20.00"),
                                "currentPrice", new BigDecimal("100000.00")
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestedCount").value(40))
                .andExpect(jsonPath("$.createdCount").value(40))
                .andExpect(jsonPath("$.createdLots", hasSize(40)))
                .andExpect(jsonPath("$.createdLots[0].lotNumber").value("L-01"))
                .andExpect(jsonPath("$.createdLots[0].code").value("MZA-40-L-01"))
                .andExpect(jsonPath("$.createdLots[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.createdLots[39].lotNumber").value("L-40"))
                .andExpect(jsonPath("$.createdLots[39].code").value("MZA-40-L-40"));
    }

    @Test
    void rejectsInvalidBulkRangeAndDoesNotInsertOnConflict() throws Exception {
        mockMvc.perform(post("/api/blocks/{blockId}/lots/bulk", blockOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "startNumber", 2,
                                "endNumber", 1,
                                "numberPrefix", "L-",
                                "numberPadding", 2
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/blocks/{blockId}/lots/bulk", blockOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "startNumber", 1,
                                "endNumber", 2,
                                "numberPrefix", "L-",
                                "numberPadding", 2
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.validationErrors.conflicts").value(containsString("L-01")));

        mockMvc.perform(get("/api/lots")
                        .param("blockId", blockOneId.toString())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getsLotDetailAndReturnsNotFoundForMissingLot() throws Exception {
        mockMvc.perform(get("/api/lots/{id}", lotOneId).header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("MZA-01-L-01"))
                .andExpect(jsonPath("$.price").value(120000.00));

        mockMvc.perform(get("/api/lots/{id}", 999999L).header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void createsLotWithGeneratedCodeAndAvailableStatus() throws Exception {
        mockMvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "blockId", blockOneId,
                                "lotNumber", "L-09",
                                "areaM2", new BigDecimal("210.00"),
                                "frontMeters", new BigDecimal("10.00"),
                                "depthMeters", new BigDecimal("21.00"),
                                "currentPrice", new BigDecimal("230000.00"),
                                "locationReference", "East side",
                                "notes", "New lot"
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("MZA-01-L-09"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void rejectsMissingBlockAndDuplicateLotNumber() throws Exception {
        mockMvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("blockId", 999999L, "lotNumber", "L-09")))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("blockId", blockOneId, "lotNumber", "L-01")))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());

        mockMvc.perform(post("/api/lots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "blockId", blockOneId,
                                "lotNumber", "L-10",
                                "areaM2", new BigDecimal("-1.00")
                        )))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void editsAvailableLotAndRegeneratesCode() throws Exception {
        mockMvc.perform(put("/api/lots/{id}", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockTwoId(), "L-11", lotVersion(lotOneId), "120000.00", null)))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("MZA-02-L-11"));
    }

    @Test
    void soldLotOnlyAllowsLocationAndNotes() throws Exception {
        mockMvc.perform(put("/api/lots/{id}", soldLotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockOneId, "L-02", lotVersion(soldLotId), "130000.00", null)))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());
    }

    @Test
    void blocksAndUnblocksLotAndRejectsManualSold() throws Exception {
        mockMvc.perform(patch("/api/lots/{id}/status", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "BLOCKED", "version", lotVersion(lotOneId))))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BLOCKED"));

        long blockedVersion = lotVersion(lotOneId);
        mockMvc.perform(patch("/api/lots/{id}/status", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "AVAILABLE", "version", blockedVersion)))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        mockMvc.perform(patch("/api/lots/{id}/status", soldLotId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "BLOCKED", "version", lotVersion(soldLotId))))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/lots/{id}/status", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "SOLD", "version", lotVersion(lotOneId))))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());
    }

    @Test
    void recordsPriceChangesOnlyWithReasonAndDetectsVersionConflict() throws Exception {
        mockMvc.perform(put("/api/lots/{id}", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockOneId, "L-01", lotVersion(lotOneId), "120000.00", null)))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/lots/{id}/price-history", lotOneId)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        long currentVersion = lotVersion(lotOneId);
        mockMvc.perform(put("/api/lots/{id}", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockOneId, "L-01", currentVersion, "121000.00", null)))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/lots/{id}", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockOneId, "L-01", currentVersion, "121000.00", "Updated market price")))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/lots/{id}/price-history", lotOneId)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].reason").value("Updated market price"))
                .andExpect(jsonPath("$[0].changedBy").value("admin"));

        mockMvc.perform(put("/api/lots/{id}", lotOneId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(updatePayload(blockOneId, "L-01", currentVersion, "122000.00", "Stale update")))
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isConflict());
    }

    @Test
    void getsCompleteMapOrderedByBlockAndLot() throws Exception {
        mockMvc.perform(get("/api/lotifications/{id}/map", lotificationId)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lotification.id").value(lotificationId))
                .andExpect(jsonPath("$.lotification.svgViewBox").value("0 0 1920 1080"))
                .andExpect(jsonPath("$.blocks", hasSize(2)))
                .andExpect(jsonPath("$.blocks[0].code").value("MZA-01"))
                .andExpect(jsonPath("$.blocks[1].code").value("MZA-02"))
                .andExpect(jsonPath("$.lots", hasSize(3)))
                .andExpect(jsonPath("$.lots[0].code").value("MZA-01-L-01"))
                .andExpect(jsonPath("$.lots[0].svgPath").value("M0 0 L10 0 L10 10 Z"))
                .andExpect(jsonPath("$.lots[1].code").value("MZA-01-L-02"))
                .andExpect(jsonPath("$.lots[2].code").value("MZA-02-L-01"))
                .andExpect(content().string(not(containsString("password"))));
    }

    @Test
    void missingLotificationMapReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/lotifications/{id}/map", 999999L)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    void lotsWithoutShapeKeepShapeFieldsNull() throws Exception {
        mockMvc.perform(get("/api/lots")
                        .param("search", "MZA-01-L-02")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].svgPath", nullValue()));
    }

    private User user(String username, String fullName, String password, boolean active) {
        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setActive(active);
        return user;
    }

    private LandBlock block(Lotification lotification, String code, String referenceColor) {
        LandBlock block = new LandBlock();
        block.setLotification(lotification);
        block.setCode(code);
        block.setAreaM2(new BigDecimal("1000.00"));
        block.setLotCount(2);
        block.setReferenceColor(referenceColor);
        return block;
    }

    private Long blockTwoId() {
        return blockRepository.findAll().stream()
                .filter(block -> "MZA-02".equals(block.getCode()))
                .findFirst()
                .orElseThrow()
                .getId();
    }

    private Long lotVersion(Long id) {
        return lotRepository.findById(id).orElseThrow().getVersion();
    }

    private Map<String, Object> updatePayload(
            Long blockId,
            String lotNumber,
            Long version,
            String currentPrice,
            String priceChangeReason
    ) {
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("blockId", blockId);
        payload.put("lotNumber", lotNumber);
        payload.put("areaM2", new BigDecimal("105.00"));
        payload.put("frontMeters", new BigDecimal("7.00"));
        payload.put("depthMeters", new BigDecimal("15.00"));
        payload.put("currentPrice", new BigDecimal(currentPrice));
        payload.put("locationReference", "Updated side");
        payload.put("notes", "Updated notes");
        payload.put("version", version);
        payload.put("priceChangeReason", priceChangeReason);
        return payload;
    }

    private Lot lot(LandBlock block, String lotNumber, String code, LotStatus status) {
        Lot lot = new Lot();
        lot.setBlock(block);
        lot.setLotNumber(lotNumber);
        lot.setCode(code);
        lot.setAreaM2(new BigDecimal("105.00"));
        lot.setFrontMeters(new BigDecimal("7.00"));
        lot.setDepthMeters(new BigDecimal("15.00"));
        lot.setCurrentPrice(new BigDecimal("120000.00"));
        lot.setStatus(status);
        lot.setLocationReference("North side");
        return lot;
    }

    private String bearerToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", "admin", "password", "password"))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return "Bearer " + response.get("accessToken").asText();
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private static PostgreSQLContainer<?> startPostgresIfNeeded() {
        if (hasText(EXTERNAL_DATABASE_URL)) {
            return null;
        }
        PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("land_sales_test")
                .withUsername("land_sales_test")
                .withPassword("land_sales_test");
        postgres.start();
        Runtime.getRuntime().addShutdownHook(new Thread(postgres::stop));
        return postgres;
    }

    private static String databaseUrl() {
        if (hasText(EXTERNAL_DATABASE_URL)) {
            return EXTERNAL_DATABASE_URL;
        }
        return POSTGRES.getJdbcUrl();
    }

    private static String databaseUsername() {
        String username = System.getenv("LAND_SALES_TEST_DB_USERNAME");
        if (hasText(username)) {
            return username;
        }
        return POSTGRES.getUsername();
    }

    private static String databasePassword() {
        String password = System.getenv("LAND_SALES_TEST_DB_PASSWORD");
        if (hasText(password)) {
            return password;
        }
        return POSTGRES.getPassword();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
