#!/bin/sh
rm -rf ffmpeg_output*
rm -d ffmpeg_output
mkdir ffmpeg_output
for file in *; do
  ffmpeg -i "${file}" -ar 176400 -acodec pcm_s24le -dither_method triangular_hp -cheby 1 -resampler soxr -cutoff 0.999999999999999999999999999999999999999 -precision 33 "ffmpeg_output/ffmpeg_out_${file}"
done
chmod -R 777 ffmpeg_output
