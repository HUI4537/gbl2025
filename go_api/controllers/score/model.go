package score

type Participation struct {
	BID   string `gorm:"column:bid" json:"bid"`
	UID   string `gorm:"column:uid" json:"uid"`
	PID   string `gorm:"column:pid" json:"pid"`
	Type  string `gorm:"column:type" json:"type"` // 지급 방식: qr, auto, 2fa 등
	Score int    `json:"score"`
}
