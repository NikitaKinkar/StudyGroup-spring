# Multi-stage build for Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/study-group-finder-backend-*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx384m", "-Xms256m", "-jar", "app.jar"]

