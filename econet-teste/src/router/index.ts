import { createRouter, createWebHistory } from 'vue-router'

const CompanyListPage = () => import('@/pages/companies/CompanyListPage.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/companies' },
    { path: '/companies', component: CompanyListPage }
  ]
})
