import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
// 纸面噪点很吃码率：CRF 26 + slow 约 30 MB，画质与 CRF 18 肉眼难分
Config.setCrf(26);
Config.setX264Preset('slow');
// 标准 BT.709，避免部分播放器把全范围色彩显示得发灰
Config.setColorSpace('bt709');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
