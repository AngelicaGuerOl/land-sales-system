package com.angelica.landsalesbackend;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.block.repository.BlockRepository;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotMapShape;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.repository.LotMapShapeRepository;
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
    PasswordEncoder passwordEncoder;

    private Long lotificationId;
    private Long blockOneId;
    private Long lotOneId;

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
    }

    @BeforeEach
    void setUp() {
        lotMapShapeRepository.deleteAll();
        lotRepository.deleteAll();
        blockRepository.deleteAll();
        lotificationRepository.deleteAll();
        userRepository.deleteAll();

        User activeUser = user("admin", "Admin User", "password", true);
        userRepository.save(activeUser);
        userRepository.save(user("inactive", "Inactive User", "password", false));

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
        lotRepository.save(lotTwo);

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
