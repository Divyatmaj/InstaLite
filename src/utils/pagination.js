const POSITIVE_INT = /^[1-9]\d*$/;
const MAX_LIMIT = 50;

// Returns { page, limit } or { error } when page / limit are invalid
function parsePagination(query) {
  const { page = "1", limit = "10" } = query;

  if (!POSITIVE_INT.test(page) || !POSITIVE_INT.test(limit)) {
    return { error: "page and limit must be positive integers" };
  }

  return { page: Number(page), limit: Math.min(Number(limit), MAX_LIMIT) };
}

function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

module.exports = { parsePagination, paginationMeta };
