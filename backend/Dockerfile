# syntax=docker/dockerfile:1.7
# ---------- build ----------
FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build -tags nodynamic -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ---------- dev (hot reload with air) ----------
FROM golang:1.26-alpine AS dev
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
CMD ["air", "-c", ".air.toml"]

# ---------- runtime ----------
FROM gcr.io/distroless/static-debian12:nonroot AS runtime
ENV TZ=Asia/Jakarta
COPY --from=build /out/server /usr/local/bin/server
USER nonroot:nonroot
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["/usr/local/bin/server", "healthcheck"]
ENTRYPOINT ["/usr/local/bin/server"]
