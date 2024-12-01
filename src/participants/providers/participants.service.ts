import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant } from '../schemas/participant.schema';
import { Event } from '../../events/schemas/event.schema';
import { CreateParticipantDto } from '../dtos/create-participant.dto';
import { UpdateParticipantDto } from '../dtos/update-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectModel(Participant.name)
    private readonly participantModel: Model<Participant>,
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
  ) {}

  async findAll(): Promise<Participant[]> {
    return this.participantModel.find().exec();
  }

  async create(
    createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    const createdParticipant = new this.participantModel(createParticipantDto);
    const participant = await createdParticipant.save();

    const event = await this.eventModel.findById(createParticipantDto.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    event.participants.push(participant._id as any);
    await event.save();

    return participant;
  }

  async findByEmail(email: string): Promise<Participant | null> {
    return this.participantModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<Participant | null> {
    return this.participantModel.findById(id).exec();
  }

  async update(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant | null> {
    return this.participantModel
      .findByIdAndUpdate(id, updateParticipantDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Participant | null> {
    return this.participantModel.findByIdAndDelete(id).exec();
  }
}