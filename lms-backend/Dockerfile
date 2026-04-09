# Stage 1: Build the application securely using the correct Maven and Java 17 environment
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code natively into the docker container
COPY pom.xml .
COPY src ./src

# Compile the application (skipping tests for faster deployment)
RUN mvn clean package -DskipTests

# Stage 2: Run the application securely using a lightweight Java 17 runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the compiled JAR from Stage 1 natively
COPY --from=build /app/target/*.jar app.jar

# Expose standard port 8080
EXPOSE 8080

# Execute the Spring Boot application natively
ENTRYPOINT ["java","-jar","app.jar"]
