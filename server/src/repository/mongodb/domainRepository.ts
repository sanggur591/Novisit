import Domain from "../../models/Domain.js";

// 모든 도메인 조회
export async function findAllDomains() {
  try {
    // .lean()을 사용하여 plain JavaScript 객체로 반환
    // ObjectId를 문자열로 변환하여 반환
    const domains = await Domain.find({})
    .select('_id name description icon')
    .lean();

    return domains.map(domain => ({
      ...domain,
      _id: domain._id.toString(),
    }));
  } catch (error) {
    console.error("❌ 도메인 조회 실패:", error);
    throw error;
  }
}

// domain_id로 도메인 조회
export async function findDomainById(domainId: string) {
  try {
    const domain = await Domain.findById(domainId);
    return domain;
  } catch (error) {
    console.error("❌ 도메인 조회 실패:", error);
    throw error;
  }
}

// 초기 도메인 데이터 생성
export async function initializeDomains(initialDomains: Array<{
  _id?: string | number;
  name: string;
  desc: string;
  icon: string;
}>) {
  try {
    // 현재 도메인 개수 확인
    const domainCount = await Domain.countDocuments();
    
    // 이미 도메인이 있으면 초기화하지 않음
    if (domainCount > 0) {
      console.log(`📋 도메인이 이미 존재합니다 (${domainCount}개). 초기화를 건너뜁니다.`);
      return;
    }

    // 초기 도메인 데이터 생성 (_id가 명시되어 있으면 사용)
    const createdDomains = await Domain.insertMany(
      initialDomains.map(domain => ({
          name: domain.name,
          desc: domain.desc,
          icon: domain.icon,
        }))
      );


    console.log(`✅ 초기 도메인 데이터가 생성되었습니다 (${createdDomains.length}개)`);
    if (initialDomains.some(d => d._id !== undefined)) {
      console.log(`📌 명시적으로 지정된 _id가 적용되었습니다.`);
    }
    return createdDomains;
  } catch (error) {
    console.error("❌ 초기 도메인 데이터 생성 실패:", error);
    throw error;
  }
}
