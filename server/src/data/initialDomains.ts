/**
 * 서버 최초 실행 시 자동으로 생성될 초기 도메인 데이터
 * 이 파일을 수정하여 초기 도메인을 설정할 수 있습니다.
 */

export interface InitialDomainData {
  _id?: string | number; // 명시적으로 지정할 _id (옵셔널)
  name: string;
  desc: string;
  icon: string;
}

export const initialDomains: InitialDomainData[] = [
  {
    _id: "1", // 명시적으로 _id 지정 (문자열 또는 숫자 가능)
    name: "취업테스트",
    desc: "대기업, 공기업, 스타트업 등 다양한 채용 공고를 한눈에 확인하세요.",
    icon: "Briefcase",
  },
  // 필요에 따라 더 많은 도메인을 추가할 수 있습니다
  // {
  //   _id: "2", // 또는 숫자로 _id: 2
  //   name: "Another Domain",
  //   description: "디자인, 개발, 논문, 영상 등 다양한 분야의 공모전",
  //   icon: "Trophy",
  // },
];

