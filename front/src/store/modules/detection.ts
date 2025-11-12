import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ClothCarInfo {
  id: string
  carNumber: string
  loadingStatus: boolean
  position: string
  lastUpdated: string
}

interface DetectionData {
  clothCars: ClothCarInfo[]
  currentPage: number
  total: number
}

export const useDetectionStore = defineStore('detection', () => {
  const detectionData = ref<DetectionData>({
    clothCars: [],
    currentPage: 1,
    total: 0
  })
  
  function setClothCars(cars: ClothCarInfo[]) {
    detectionData.value.clothCars = cars
  }
  
  function updateClothCar(car: ClothCarInfo) {
    const index = detectionData.value.clothCars.findIndex(c => c.id === car.id)
    if (index !== -1) {
      detectionData.value.clothCars[index] = car
    }
  }
  
  function setPagination(page: number, total: number) {
    detectionData.value.currentPage = page
    detectionData.value.total = total
  }
  
  function findClothCar(carNumber: string): ClothCarInfo | undefined {
    return detectionData.value.clothCars.find(car => car.carNumber === carNumber)
  }
  
  return {
    detectionData,
    setClothCars,
    updateClothCar,
    setPagination,
    findClothCar
  }
})