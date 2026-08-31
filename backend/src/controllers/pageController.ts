import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getPages = async (req: Request, res: Response) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    if (!title && title !== '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const newPage = await prisma.page.create({
      data: { title, content: '' }
    });
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create page' });
  }
};

export const getPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id }
    });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, title } = req.body;

    // Budujemy obiekt danych tylko z polami, które faktycznie przyszły w body
    // Zapobiega to nadpisywaniu istniejących danych wartościami undefined/null
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const updatedPage = await prisma.page.update({
      where: { id },
      data: updateData
    });

    res.json(updatedPage);
  } catch (error: any) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.page.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' });
  }
};
