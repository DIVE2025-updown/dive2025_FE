import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref([
    { careNm: '(사)유기동물 및 동물보호관리협회', status: 'pending' },
    { careNm: '누리동물병원', status: 'pending' },
  ]);

  const pendingCount = computed(() => {
    return applications.value.filter((app) => app.status === 'pending').length;
  });

  const acceptApplication = (app) => {
    const foundApp = applications.value.find((a) => a.careNm === app.careNm);
    if (foundApp) {
      foundApp.status = 'accepted';
      console.log(`'${app.careNm}'의 신청을 수락했습니다.`);
    }
  };

  const rejectApplication = (app) => {
    const foundApp = applications.value.find((a) => a.careNm === app.careNm);
    if (foundApp) {
      foundApp.status = 'rejected';
      console.log(`'${app.careNm}'의 신청을 거절했습니다.`);
    }
  };

  return {
    applications,
    pendingCount,
    acceptApplication,
    rejectApplication,
  };
});
