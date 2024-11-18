build:
	go build -o gbl-api gbl-api/cmd/gbl-api

run: build
	./gbl-api

test:
	go test -v ./...

clean:
	del /Q gbl-api
	del /Q *.db
	del /Q *.log