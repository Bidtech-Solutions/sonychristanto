// Package auth handles password hashing (bcrypt) and JWT session tokens.
package auth

import (
	"errors"
	"fmt"
	"time"
	"unicode/utf8"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const bcryptCost = 12

func ValidatePassword(p string) error {
	if utf8.RuneCountInString(p) < 8 {
		return errors.New("password minimal 8 karakter")
	}
	if len(p) > 72 { // bcrypt only uses the first 72 bytes
		return errors.New("password maksimal 72 byte")
	}
	return nil
}

func HashPassword(p string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(p), bcryptCost)
	return string(b), err
}

func CheckPassword(hash, p string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(p)) == nil
}

// dummyHash lets login spend the same time for unknown emails (no user enumeration by timing).
var dummyHash, _ = HashPassword("timing-equaliser-password")

func CheckPasswordConstantTime(hash *string, p string) bool {
	if hash == nil {
		_ = bcrypt.CompareHashAndPassword([]byte(dummyHash), []byte(p))
		return false
	}
	return CheckPassword(*hash, p)
}

type Claims struct {
	Version int `json:"ver"`
	jwt.RegisteredClaims
}

const issuer = "sonychristanto"

func IssueToken(secret string, ttl time.Duration, adminID uuid.UUID, version int) (string, time.Time, error) {
	exp := time.Now().Add(ttl)
	claims := Claims{
		Version: version,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   adminID.String(),
			Issuer:    issuer,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	s, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	return s, exp, err
}

func ParseToken(secret, token string) (*Claims, error) {
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithIssuer(issuer), jwt.WithExpirationRequired())
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}
	return claims, nil
}
