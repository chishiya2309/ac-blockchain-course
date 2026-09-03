//Author: Quang Hung Le
// Last modified: 03/09/2026
import * as crypto from 'crypto';
export type Block = {
  index: number;
  timestamp: string;
  transactions: any[];
  previous_hash: string;
  current_hash: string;
};

/*
Kiểm tra tính hợp lệ của một Block bằng cách tính lại mã và đối chiếu với current_hash hiện tại của block đó
*/
export function isValidBlock(block: Block): boolean {
  // Ta chuyển đổi mảng transactions thành chuỗi JSON để giữ nguyên cấu trúc dữ liệu chi tiết
  const transactionStr = JSON.stringify(block.transactions);

  // Ghép nối các trường dữ liệu
  const rawData = `${block.index}${block.timestamp}${transactionStr}${block.previous_hash}`;

  // Băm chuỗi dữ liệu thô bằng SHA-256
  const calculatedHash = crypto
    .createHash('sha256')
    .update(rawData)
    .digest('hex');

  return calculatedHash == block.current_hash;
}
