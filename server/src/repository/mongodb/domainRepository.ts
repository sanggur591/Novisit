import Domain from "../../models/Domain";

// 모든 도메인 조회
export async function findAllDomains() {
  try {
    const domains = await Domain.find({}, { name: 1, url_list: 1, keywords: 1 });
    return domains;
  } catch (error) {
    console.error("❌ 도메인 조회 실패:", error);
    throw error;
  }
}

// Domain에 setting_id 추가
export async function addSettingIdToDomain(domainId: string, settingId: string) {
  try {
    const domain = await Domain.findById(domainId);
    if (!domain) {
      throw new Error(`Domain을 찾을 수 없습니다: ${domainId}`);
    }

    // 이미 존재하는지 확인
    if (!domain.setting_ids.includes(settingId)) {
      domain.setting_ids.push(settingId);
      await domain.save();
    }
    return domain;
  } catch (error) {
    console.error("❌ Domain에 setting_id 추가 실패:", error);
    throw error;
  }
}

// Domain에서 setting_id 제거
export async function removeSettingIdFromDomain(domainId: string, settingId: string) {
  try {
    const domain = await Domain.findById(domainId);
    if (!domain) {
      throw new Error(`Domain을 찾을 수 없습니다: ${domainId}`);
    }

    // setting_id가 존재하면 제거
    domain.setting_ids = domain.setting_ids.filter(id => id.toString() !== settingId.toString());
    await domain.save();
    return domain;
  } catch (error) {
    console.error("❌ Domain에서 setting_id 제거 실패:", error);
    throw error;
  }
}
