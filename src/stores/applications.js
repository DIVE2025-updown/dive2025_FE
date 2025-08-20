import { defineStore } from 'pinia';

export const useApplicationsStore = defineStore('applications', {
  state: () => ({
    sentApplications: [],
    receivedApplications: [],
  }),

  actions: {
    _uuid() {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    },

    sendApplication(payload) {
      const id = this._uuid();
      const now = new Date().toISOString();

      this.sentApplications.unshift({
        id,
        fromShelter: payload.fromShelter,
        toShelter: payload.toShelter,
        animalIds: payload.animalIds,
        status: 'applying',
        createdAt: now,
      });

      this.receivedApplications.unshift({
        id,
        fromShelter: payload.fromShelter,
        toShelter: payload.toShelter,
        animalIds: payload.animalIds,
        status: 'pending',
        createdAt: now,
      });
    },

    accept(id) {
      const recv = this.receivedApplications.find((a) => a.id === id);
      if (recv) recv.status = 'accepted';

      const sent = this.sentApplications.find((a) => a.id === id);
      if (sent) sent.status = 'accepted';
    },

    reject(id) {
      const recv = this.receivedApplications.find((a) => a.id === id);
      if (recv) recv.status = 'rejected';

      const sent = this.sentApplications.find((a) => a.id === id);
      if (sent) sent.status = 'rejected';
    },

    cancel(id) {
      const sent = this.sentApplications.find((a) => a.id === id);
      if (sent) sent.status = 'canceled';

      const recv = this.receivedApplications.find((a) => a.id === id);
      if (recv) recv.status = 'canceled';
    },
  },
});
