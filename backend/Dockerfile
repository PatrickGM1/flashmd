# --- build ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

# --- run ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# decks persist here; mounted as a volume in compose
ENV FLASHMD_DATA_FILE=/app/data/decks.json
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
