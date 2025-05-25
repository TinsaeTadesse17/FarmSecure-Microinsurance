import { Injectable } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ConfigService {
  // CPS Zone
  async uploadCpsZone(
    trigger: Express.Multer.File,
    exit:    Express.Multer.File,
    growing: Express.Multer.File,
  ) {
    // TODO: process Excel files, enqueue jobs, persist metadata...
  }

  async getCpsZonePeriodConfig(cpsZone: number, period: number) {
    // TODO: fetch config for given zone & period
  }

  async getAllPeriodsForCpsZone(cpsZone: number) {
    // TODO: list all period configs for zone
  }

  async getUploadedCpsFiles() {
    // TODO: list metadata for all uploaded CPS files
  }

  async getUploadedCpsFile(filename: string) {
    // TODO: stream or return metadata for one CPS file
  }

  // NDVI
  async uploadNdviFile(file: Express.Multer.File) {
    // TODO: process NDVI file, enqueue processing job...
  }

  async getNdviUploadStatus(jobId: string) {
    // TODO: return job status & metadata
  }

  async getNdvi(gridId: number, periodId: number) {
    // TODO: return computed NDVI for grid & period
  }

  async getNdviForGrid(gridId: number) {
    // TODO: return all NDVI entries for grid
  }

  async getAllNdviData(skip: number, limit: number) {
    // TODO: pagination over NDVI data
  }

  async getUploadedNdviFiles() {
    // TODO: list metadata for all uploaded NDVI files
  }

  async getUploadedNdviFile(filename: string) {
    // TODO: stream or return metadata for one NDVI file
  }
}
