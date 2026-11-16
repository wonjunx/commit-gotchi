// 이름 뒤 조사: withJosa('코딩이', '이', '가') → '코딩이가', withJosa('픽셀', '이', '가') → '픽셀이'
export function withJosa(name, withBatchim, withoutBatchim) {
  const last = name?.charCodeAt(name.length - 1)
  if (!last) return name ?? ''
  if (last >= 0xac00 && last <= 0xd7a3) {
    return name + ((last - 0xac00) % 28 ? withBatchim : withoutBatchim)
  }
  return name + withoutBatchim
}
