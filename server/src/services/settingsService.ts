import { createSetting, getSettings, updateSetting, deleteSetting } from "../repository/mongodb/settingsRepository";


// 알림 설정 생성
export async function createUserSetting(userId: string, data: any) {
  const { domain_id, name, filter_keywords, url_list } = data;

  // 필수 값 확인
  if (!domain_id || !name) {
    throw new Error("domain_id와 name은 필수입니다.");
  }

  // DB에 저장할 데이터 구성
  const settingData = {
    user_id: userId,
    domain_id,
    name,
    url_list: url_list || [],
    filter_keywords: filter_keywords || [],
    messages: [],
  };

  return await createSetting(settingData);
}

// 알림 설정 조회
export const getUserSettings = async (userId: string) => {
  try {
    return await getSettings(userId);
  } catch (error) {
    throw new Error("알림 설정 조회 중 오류가 발생했습니다.");
  }
};

// 알림 설정 수정
export const updateUserSetting = async (settingId: string, updateData: any) => {
  try {
    const updated = await updateSetting(settingId, updateData);
    if (!updated) {
      throw new Error("해당 알림 설정을 찾을 수 없습니다.");
    }
    return updated;
  } catch (error) {
    throw new Error("알림 설정 수정에 실패했습니다.");
  }
};

// 알림 설정 삭제
export const deleteUserSetting = async (settingId: string) => {
  try {
    const result = await deleteSetting(settingId);
    if (!result) {
      throw new Error("해당 알림 설정을 찾을 수 없습니다.");
    }
    return result;
  } catch (error) {
    throw new Error("알림 설정 삭제에 실패했습니다.");
  }
};