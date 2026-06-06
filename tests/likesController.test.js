jest.mock("../server/models/likes", () => ({
    create: jest.fn(),
    delete: jest.fn()
}));

const likes = require("../server/models/likes");
const likesController = require("../server/controllers/likesController");

function createResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };
}

describe("likesController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("creates a like for the authenticated user", async () => {
        const req = {
            params: { id: "3" },
            user: { sub: 7 }
        };
        const res = createResponse();
        const createdLike = { id: 11, spot_id: 3, user_id: 7 };
        likes.create.mockResolvedValue(createdLike);

        await likesController.create(req, res);

        expect(likes.create).toHaveBeenCalledWith({
            spotId: 3,
            userId: 7
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdLike);
    });

    test("returns 409 when the user already liked the spot", async () => {
        const req = {
            params: { id: "3" },
            user: { sub: 7 }
        };
        const res = createResponse();
        likes.create.mockRejectedValue({ code: "SQLITE_CONSTRAINT" });

        await likesController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            code: "ALREADY_LIKED",
            message: "You already liked this spot"
        });
    });

    test("removes the authenticated user's like", async () => {
        const req = {
            params: { id: "3" },
            user: { sub: 7 }
        };
        const res = createResponse();
        likes.delete.mockResolvedValue(1);

        await likesController.remove(req, res);

        expect(likes.delete).toHaveBeenCalledWith({
            spotId: 3,
            userId: 7
        });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
    });
});
