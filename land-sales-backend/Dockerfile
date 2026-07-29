FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /workspace

RUN apk add --no-cache curl tar

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src src

RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup -S spring \
    && adduser -S spring -G spring

COPY --from=build /workspace/target/land-sales-backend-*.jar app.jar

USER spring:spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS "http://localhost:${PORT:-8080}/actuator/health" || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
