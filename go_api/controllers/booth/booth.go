package booth

import (
	"gbl-api/data"
	"log"
	"math/rand"

	"gorm.io/gorm"
)

func GetBooths() (map[string]interface{}, error) {
	db := data.GetDatabase()
	var booths []Booth
	err := db.Find(&booths).Error
	if err != nil {
		log.Printf("DB 조회 오류: %v", err)
		return nil, err
	}
	log.Printf("조회된 부스 수: %d", len(booths))

	// 클라이언트가 기대하는 형식으로 응답 구조화
	response := map[string]interface{}{
		"boothlist": booths,
	}

	return response, nil
}

func GetBooth(db *gorm.DB, bid string) (*Booth, error) {
	var booth Booth
	if err := db.Where("bid = ?", bid).First(&booth).Error; err != nil {
		return nil, err
	}
	return &booth, nil
}

func GetBoothIdByPassword(password string) (string, error) {
	db := data.GetDatabase()
	var boothPw BoothPassword
	err := db.Where("password = ?", password).First(&boothPw).Error
	if err == gorm.ErrRecordNotFound {
		return "", nil
	} else if err != nil {
		return "", err
	} else {
		return boothPw.BID, nil
	}
}

func DeleteBooth(bid string) error {
	db := data.GetDatabase()
	return db.Delete(&Booth{}, "bid = ?", bid).Error
}

func generateRandomString(n int) string {
	charSet := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = charSet[rand.Intn(len(charSet))]
	}

	return string(b)
}

func generateRandomBID() string {
	return generateRandomString(64)
}

func AddPassword(password string) error {
	db := data.GetDatabase()
	return db.Create(&BoothPassword{
		Password: password,
		BID:      generateRandomBID(),
	}).Error
}

func DeletePasswordByBID(bid string) error {
	db := data.GetDatabase()
	return db.Delete(&BoothPassword{}, "bid = ?", bid).Error
}

func AddUIDToBooth(db *gorm.DB, bid string, uid string) error {
	var booth Booth
	if err := db.Where("bid = ?", bid).First(&booth).Error; err != nil {
		return err
	}
	booth.UIDs = append(booth.UIDs, uid)
	return db.Save(&booth).Error
}

func SetComplexity(bid string, complexity int) error {
	db := data.GetDatabase()
	var booth Booth
	err := db.Where("bid = ?", bid).First(&booth).Error
	if err != nil {
		return err
	}
	booth.Complexity = complexity
	return db.Where("bid = ?", bid).Save(&booth).Error
}

func IsUidInBooth(bid string, uid string) (bool, error) {
	db := data.GetDatabase()
	var booth Booth
	err := db.Where("bid = ?", bid).First(&booth).Error
	if err != nil {
		return false, err
	}
	for _, u := range booth.UIDs {
		if u == uid {
			return true, nil
		}
	}
	return false, nil
}

func CreateBooth(booth *Booth) error {
	db := data.GetDatabase()
	if booth.TimeSlot == "" {
		booth.TimeSlot = "A"
	}
	return db.Create(booth).Error
}
