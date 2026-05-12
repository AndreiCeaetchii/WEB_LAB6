FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CarTrack.sln ./
COPY CarTrack.Domain/CarTrack.Domain.csproj CarTrack.Domain/
COPY CarTrack.Application/CarTrack.Application.csproj CarTrack.Application/
COPY CarTrack.Infrastructure/CarTrack.Infrastructure.csproj CarTrack.Infrastructure/
COPY CarTrack.API/CarTrack.API.csproj CarTrack.API/
RUN dotnet restore CarTrack.API/CarTrack.API.csproj

COPY . .
RUN dotnet publish CarTrack.API/CarTrack.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "CarTrack.API.dll"]
