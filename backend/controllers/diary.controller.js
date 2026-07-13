const diaryService = require('../services/diary.service');
const diaryDTO = require('../dto/diary.dto');
const { sendSuccess } = require('../responses/success');

class DiaryController {
  async getEntries(req, res, next) {
    try {
      const entries = await diaryService.getEntries(req.user.id);
      const responseData = diaryDTO.toCollectionResponse(entries);
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async createEntry(req, res, next) {
    try {
      const { entry, isUpdated } = await diaryService.createEntry(req.user.id, req.body);
      const responseData = {
        entry: diaryDTO.toResponse(entry)
      };
      return sendSuccess(res, responseData, isUpdated ? 200 : 201);
    } catch (err) {
      next(err);
    }
  }

  async getEntryById(req, res, next) {
    try {
      const id = Number(req.params.id);
      const entry = await diaryService.getEntryById(id, req.user.id);
      const responseData = {
        entry: diaryDTO.toResponse(entry)
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }

  async updateEntry(req, res, next) {
    try {
      const id = Number(req.params.id);
      const entry = await diaryService.updateEntry(id, req.user.id, req.body);
      const responseData = {
        entry: diaryDTO.toResponse(entry)
      };
      return sendSuccess(res, responseData, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DiaryController();
