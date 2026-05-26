describe("test environment", () => {
    test("runs Jest successfully", () => {
        // CI 초기 설정이 테스트 파일을 발견하고 실행하는지 확인한다.
        // Verify that the initial CI setup can discover and run a test file.
        expect(true).toBe(true);
    });
});
