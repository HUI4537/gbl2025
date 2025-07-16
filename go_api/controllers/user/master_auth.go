package user

import (
    "encoding/json"
    "net/http"
    "os"
)

type MasterAuthRequest struct {
    Password string `json:"password"`
}

type MasterAuthResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message,omitempty"`
}

func MasterAuthHandler(w http.ResponseWriter, r *http.Request) {
    var req MasterAuthRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(MasterAuthResponse{Success: false, Message: "잘못된 요청입니다."})
        return
    }

    masterPw := os.Getenv("MASTER_PASSWORD")
    if masterPw == "" {
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(MasterAuthResponse{Success: false, Message: "서버 설정 오류"})
        return
    }

    if req.Password == masterPw {
        json.NewEncoder(w).Encode(MasterAuthResponse{Success: true})
    } else {
        w.WriteHeader(http.StatusUnauthorized)
        json.NewEncoder(w).Encode(MasterAuthResponse{Success: false, Message: "비밀번호가 올바르지 않습니다."})
    }
}